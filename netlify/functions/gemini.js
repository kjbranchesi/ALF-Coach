// Netlify Function: Gemini API proxy (production-safe)
// CommonJS export for broad Netlify compatibility
// Requires env var GEMINI_API_KEY set in Netlify UI

const https = require('https');

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
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt, history, model, systemPrompt, generationConfig } = JSON.parse(event.body || '{}');
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'GEMINI_API_KEY is not configured' })
      };
    }

    const selectedModel = (typeof model === 'string' && model) ? model : 'gemini-1.5-flash';
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
