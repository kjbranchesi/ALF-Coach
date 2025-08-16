const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check for API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('Missing GOOGLE_AI_API_KEY environment variable');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'API configuration error',
          message: 'Service temporarily unavailable'
        })
      };
    }

    // Parse request body
    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body'
        })
      };
    }

    const { prompt, history } = requestData;

    if (!prompt) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Missing required prompt parameter'
        })
      };
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Build conversation history
    const chatHistory = history || [];
    
    // Start chat session with history
    const chat = model.startChat({
      history: chatHistory.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: msg.parts.map(part => part.text).join(' ')
      }))
    });

    // Generate response
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    // Return successful response in expected format
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        candidates: [{
          content: {
            parts: [{
              text: text
            }]
          }
        }]
      })
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Handle specific error types
    if (error.message.includes('API_KEY_INVALID')) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Invalid API key'
        })
      };
    }
    
    if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'Please wait a moment and try again'
        })
      };
    }

    // Generic error response
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'AI service temporarily unavailable'
      })
    };
  }
};