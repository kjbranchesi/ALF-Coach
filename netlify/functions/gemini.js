// Secure Gemini API proxy function - SIMPLE VERSION THAT WORKS
export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt, history, model: modelFromRequest } = JSON.parse(event.body);
    
    // Use non-VITE prefixed env var (stays server-side)
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      console.error('GEMINI_API_KEY not configured in environment variables');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'API key not configured' }),
      };
    }
    
    // Allow selecting the model via env (default stays on 1.5 for safety)
    // Model precedence: explicit request param > env var > safe default
    const MODEL = modelFromRequest || process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    // Ensure we have proper contents format
    let contents = history || [];
    
    // If history is empty or doesn't have the right format, create a proper message
    if (!contents.length || !contents[0].parts) {
      contents = [{
        role: 'user',
        parts: [{ text: prompt || 'Hello' }]
      }];
    } else if (prompt) {
      // If there's a prompt and existing history, add it as a new user message
      contents = [
        ...contents,
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ];
    }

    // Use standard https module since we're in Node.js environment
    const { request } = await import('https');
    const url = new URL(API_URL);
    
    const postData = JSON.stringify({
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        topP: 0.8,
        topK: 40,
      }
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode !== 200) {
            console.error('Gemini API error:', res.statusCode, data);
            resolve({
              statusCode: res.statusCode,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ error: `Gemini API error: ${res.statusCode}` }),
            });
          } else {
            resolve({
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: data, // Return raw Gemini response
            });
          }
        });
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        resolve({
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: 'Internal server error', details: error.message }),
        });
      });

      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};
