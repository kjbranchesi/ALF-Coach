// Netlify Function: Gemini API proxy (production-safe)
// CommonJS export for broad Netlify compatibility
// Requires env var GEMINI_API_KEY set in Netlify UI

const https = require('https');

const RATE_LIMIT = { windowMs: 60_000, max: 60 }; // 60 requests/min per IP
const bucket = global.__GEMINI_BUCKET__ || (global.__GEMINI_BUCKET__ = new Map());

function getClientIp(event) {
  const xf = event.headers['x-forwarded-for'] || event.headers['X-Forwarded-For'] || '';
  const ip = (xf.split(',')[0] || '').trim() || event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'] || 'unknown';
  return ip;
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Basic rate limiting per IP (best-effort; function instance scoped)
    const ip = getClientIp(event);
    const now = Date.now();
    const entry = bucket.get(ip) || { count: 0, start: now };
    if (now - entry.start > RATE_LIMIT.windowMs) {
      entry.count = 0; entry.start = now;
    }
    entry.count += 1;
    bucket.set(ip, entry);
    if (entry.count > RATE_LIMIT.max) {
      return {
        statusCode: 429,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Rate limit exceeded. Please wait and try again.' })
      };
    }
    const { prompt, history, model, systemPrompt, generationConfig } = JSON.parse(event.body || '{}');
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'GEMINI_API_KEY is not configured' })
      };
    }

    // Map friendly/alias model names to valid Google Gemini API model IDs
    // Using -latest aliases to always get newest versions (recommended by Google)
    const MODEL_ALIASES = {
      // Latest aliases (auto-update to newest versions)
      'gemini-2.5-flash-lite': 'gemini-flash-lite-latest',
      'flash-2.5-lite': 'gemini-flash-lite-latest',
      'flash2.5-lite': 'gemini-flash-lite-latest',
      'flash-lite': 'gemini-flash-lite-latest',
      'gemini-2.5-flash': 'gemini-flash-latest',
      'gemini-2.0-flash': 'gemini-flash-latest',
      'flash-2.5': 'gemini-flash-latest',
      'flash2.5': 'gemini-flash-latest',
      'flash': 'gemini-flash-latest',
      // Direct latest aliases
      'gemini-flash-latest': 'gemini-flash-latest',
      'gemini-flash-lite-latest': 'gemini-flash-lite-latest'
    };

    const envDefault = process.env.GEMINI_MODEL && String(process.env.GEMINI_MODEL);
    const requested = (typeof model === 'string' && model) ? model : (envDefault || 'gemini-flash-lite-latest');
    const selectedModel = MODEL_ALIASES[requested] || requested;

    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${API_KEY}`);
    const contents = Array.isArray(history) && history.length > 0
      ? (prompt ? [...history, { role: 'user', parts: [{ text: prompt }]}] : history)
      : [{ role: 'user', parts: [{ text: prompt || 'Hello' }]}];

    const cfg = Object.assign(
      { temperature: 0.7, maxOutputTokens: 1024, topP: 0.8, topK: 40 },
      typeof generationConfig === 'object' && generationConfig ? generationConfig : {}
    );

    // Prepend a lightweight system directive if provided
    const finalContents = systemPrompt
      ? [{ role: 'user', parts: [{ text: `SYSTEM INSTRUCTION:\n${systemPrompt}` }] }, ...contents]
      : contents;

    const payload = JSON.stringify({
      contents: finalContents,
      generationConfig: cfg
    });

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    };

    const start = Date.now();
    const responseBody = await new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', (err) => resolve({ status: 500, data: JSON.stringify({ error: err.message }) }));
      req.write(payload);
      req.end();
    });

    const latency = Date.now() - start;
    // Structured log (no secrets)
    console.log(JSON.stringify({
      source: 'netlify-fn-gemini', ip, model: selectedModel, status: responseBody.status, latencyMs: latency
    }));

    return {
      statusCode: responseBody.status === 200 ? 200 : (responseBody.status || 500),
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: responseBody.data
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal error', details: error.message })
    };
  }
}
