/**
 * Netlify Function: Gemini AI Chat API
 * Handles secure communication with Google Gemini API
 * Fixes 404 errors and provides reliable AI responses
 */

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'API key not configured',
          fallback: 'I apologize, but the AI service is temporarily unavailable. Please try again later.'
        })
      };
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body',
          fallback: 'There was an error processing your request. Please try again.'
        })
      };
    }

    const { prompt, history = [], systemPrompt, maxTokens = 4096 } = requestBody;

    // Health check endpoint
    if (prompt === 'health check') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          status: 'healthy',
          message: 'Gemini API is available',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Prompt is required',
          fallback: 'Please provide a message to continue our conversation.'
        })
      };
    }

    // Build API URL
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Build conversation contents for Gemini
    const contents = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'I understand. I\'ll follow these guidelines in our conversation.' }]
      });
    }

    // Add conversation history
    if (Array.isArray(history)) {
      history.forEach(msg => {
        if (msg.role && msg.content) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      });
    }

    // Add current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // Make API request to Gemini
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, response.statusText, errorText);
      
      let errorMessage = 'An unexpected error occurred';
      let fallbackMessage = 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.';

      if (response.status === 429) {
        errorMessage = 'Rate limit exceeded';
        fallbackMessage = 'The AI service is currently busy. Please wait a moment and try again.';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication error';
        fallbackMessage = 'The AI service is temporarily unavailable. Please try again later.';
      }

      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: errorMessage,
          fallback: fallbackMessage,
          timestamp: new Date().toISOString()
        })
      };
    }

    const data = await response.json();
    
    // Extract response text
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response text from Gemini API');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: responseText.trim(),
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        tokensUsed: data.usageMetadata?.totalTokenCount || 0,
        rawData: data
      })
    };

  } catch (error) {
    console.error('Gemini API Error:', error);

    // Handle specific error types
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred';
    let fallbackMessage = 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.';

    if (error.message?.includes('fetch')) {
      statusCode = 503;
      errorMessage = 'Service unavailable';
      fallbackMessage = 'The AI service is temporarily unavailable. Please try again later.';
    } else if (error.message?.includes('timeout')) {
      statusCode = 408;
      errorMessage = 'Request timeout';
      fallbackMessage = 'The request took too long to process. Please try again with a shorter message.';
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        fallback: fallbackMessage,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};